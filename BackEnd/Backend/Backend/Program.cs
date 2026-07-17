using Backend.DataManagement;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
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
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste your token like: Bearer eyJhbGciOi..."
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});
builder.Services.AddScoped<RefreshTokenDataOps>();
builder.Services.AddScoped<TokenProvider>();

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
.AddJwtBearer(options =>
{
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

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    const string adminEmail = "admin@bidsphere.com";
    const string adminPassword = "admin1234"; 
    var admin = dbContext.Users.FirstOrDefault(u => u.Email == adminEmail);

    if (admin == null)
    {
        dbContext.Users.Add(new Backend.Models.User
        {
            UserName = "admin",
            Name = "Administrator",
            Email = adminEmail,
            Role = Backend.Models.RoleEnum.Admin,
            Password = Backend.Services.PasswordHasher.HashPassword(adminPassword),
            PhoneNumber = "0714253647",
            IsBanned = false,
        });
        dbContext.SaveChanges();
    }
    else if (admin.Role != Backend.Models.RoleEnum.Admin)
    {
        admin.Role = Backend.Models.RoleEnum.Admin;
        dbContext.SaveChanges();
    }
}

app.UseRouting();
app.UseCors(myAngularPolicy);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try { db.Database.ExecuteSqlRaw("ALTER TABLE Users ADD PhoneNumber nvarchar(max) NULL"); } catch { }
    try { db.Database.ExecuteSqlRaw("SET IDENTITY_INSERT Users ON; INSERT INTO Users (ID, UserName, Name, Email, Role, Rating, PhoneNumber) VALUES (3, 'test', 'Test', 'test@test.com', 0, 0, '123456'); SET IDENTITY_INSERT Users OFF;"); } catch { }
}

app.Run();