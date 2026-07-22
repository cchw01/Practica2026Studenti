using Backend.DataManagement;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var jwtSecret = builder.Configuration["Jwt:Secret"];
var myAngularPolicy = "AllowAngularApp";

builder.Services.AddCors(options =>
{
    options.AddPolicy(myAngularPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:4200").AllowAnyMethod().AllowAnyHeader().AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<RefreshTokenDataOps>();
builder.Services.AddScoped<TokenProvider>();
builder.Services.AddScoped<EmailService>();

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "Jwt:Secret is missing. Configure it using user secrets."
    );
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
// nu schimba fara sa verifici se strica admin+notificari fara 
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"])),

        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        RoleClaimType = "role",
    };
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// ==========================================
// INITIALIZARE BAZĂ DE DATE (SCOPE UNIC)
// ==========================================
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // 1. Populare automată prin DbSeeder
    try
    {
        DbSeeder.Seed(dbContext);
    }
    catch { }

    // 2. Verificare/Adăugare Coloane Lipsă
    try
    {
        dbContext.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PhoneNumber'
            )
            BEGIN
                ALTER TABLE [Users] ADD [PhoneNumber] nvarchar(max) NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'IsBanned'
            )
            BEGIN
                ALTER TABLE [Users] ADD [IsBanned] bit NOT NULL DEFAULT 0;
            END");
    }
    catch { }

    // 3. Inserare Utilizator de Test (ID = 3)
    try
    {
        dbContext.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [ID] = 3)
            BEGIN
                SET IDENTITY_INSERT [Users] ON;

                INSERT INTO [Users]
                    ([ID], [UserName], [Name], [Email], [Role],
                     [Rating], [PhoneNumber], [IsBanned])
                VALUES
                    (3, 'test', 'Test', 'test@test.com', 0,
                     0, '123456', 0);

                SET IDENTITY_INSERT [Users] OFF;
            END");
    }
    catch { }

    // 4. Ințializare adițională prin DbInitializer
    try
    {
        DbInitializer.Seed(dbContext);
    }
    catch { }
}

// ==========================================
// MIDDLEWARE & RUTE
// ==========================================
app.UseRouting();
app.UseCors(myAngularPolicy);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();