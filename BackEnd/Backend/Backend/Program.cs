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
//nu schimba fara sa verifici se strica admin+notificari fara 
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
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    const string adminEmail = "admin@bidsphere.com";
    const string adminPassword = "admin123!";

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
            PhoneNumber = "0000000000",
            IsBanned = false,
        });
        dbContext.SaveChanges();
    }
    else if (admin.Role != Backend.Models.RoleEnum.Admin)
    {
        admin.Role = Backend.Models.RoleEnum.Admin;
        dbContext.SaveChanges();
    }

    // Seed a few categories, test users and real auction items (with images/timers)
    // so the home page search bar and countdown filtering have something to show.
    var categoryNames = new[] { "Technology", "Auto & Motors", "Art & Collectibles", "Real Estate" };
    var categories = new Dictionary<string, Backend.Models.CategoryItem>();

    foreach (var catName in categoryNames)
    {
        var category = dbContext.Category.FirstOrDefault(c => c.name == catName);
        if (category == null)
        {
            category = new Backend.Models.CategoryItem { name = catName };
            dbContext.Category.Add(category);
            dbContext.SaveChanges();
        }
        categories[catName] = category;
    }

    var seedUsers = new (string UserName, string Name, string Email)[]
    {
        ("mihai_p", "Mihai Popescu", "mihai.popescu@example.com"),
        ("elena_r", "Elena Radu", "elena.radu@example.com"),
        ("george_v", "George Vasilescu", "george.vasilescu@example.com"),
        ("ana_m", "Ana Marinescu", "ana.marinescu@example.com"),
    };

    var seededUsers = new Dictionary<string, Backend.Models.User>();

    foreach (var su in seedUsers)
    {
        var user = dbContext.Users.FirstOrDefault(u => u.Email == su.Email);
        if (user == null)
        {
            user = new Backend.Models.User
            {
                UserName = su.UserName,
                Name = su.Name,
                Email = su.Email,
                Role = Backend.Models.RoleEnum.User,
                Password = Backend.Services.PasswordHasher.HashPassword("Test1234!"),
                PhoneNumber = "0700000000",
                IsBanned = false,
            };
            dbContext.Users.Add(user);
            dbContext.SaveChanges();
        }
        seededUsers[su.UserName] = user;
    }

    {
        var now = DateTime.UtcNow;

        var seedItemDefs = new[]
        {
            new
            {
                Name = "BMW M4 Competition",
                StartPrice = 45000m,
                CurrentPrice = 47500m,
                Category = "Auto & Motors",
                Owner = "mihai_p",
                Description = "BMW M4 Competition, an 2023, impecabil, un singur proprietar.",
                Location = "Cluj-Napoca",
                EndDate = now.AddDays(3),
                ImageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop",
            },
            new
            {
                Name = "iPhone 15 Pro Max",
                StartPrice = 3500m,
                CurrentPrice = 3800m,
                Category = "Technology",
                Owner = "elena_r",
                Description = "iPhone 15 Pro Max, 256GB, sigilat, cutie originala.",
                Location = "Bucuresti",
                EndDate = now.AddHours(6),
                ImageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop",
            },
            new
            {
                Name = "Gold Necklace with Diamonds",
                StartPrice = 2200m,
                CurrentPrice = 2450m,
                Category = "Art & Collectibles",
                Owner = "george_v",
                Description = "Colier din aur de 18k cu diamante certificate.",
                Location = "Timisoara",
                EndDate = now.AddMinutes(20),
                ImageUrl = "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop",
            },
            new
            {
                Name = "Vintage Rolex Watch",
                StartPrice = 8000m,
                CurrentPrice = 8600m,
                Category = "Art & Collectibles",
                Owner = "mihai_p",
                Description = "Ceas Rolex vintage, cutie si certificat incluse.",
                Location = "Cluj-Napoca",
                EndDate = now.AddDays(1),
                ImageUrl = "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop",
            },
            new
            {
                Name = "Modern Villa with Pool",
                StartPrice = 250000m,
                CurrentPrice = 255000m,
                Category = "Real Estate",
                Owner = "ana_m",
                Description = "Vila moderna cu piscina, 5 dormitoare, vedere panoramica.",
                Location = "Constanta",
                EndDate = now.AddDays(7),
                ImageUrl = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
            },
            new
            {
                Name = "MacBook Pro 16 M3",
                StartPrice = 9000m,
                CurrentPrice = 9400m,
                Category = "Technology",
                Owner = "elena_r",
                Description = "MacBook Pro 16 inch, chip M3 Max, 36GB RAM.",
                Location = "Bucuresti",
                EndDate = now.AddMinutes(5),
                ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
            },
            new
            {
                Name = "Yamaha MT-07 Motorcycle",
                StartPrice = 15000m,
                CurrentPrice = 15600m,
                Category = "Auto & Motors",
                Owner = "ana_m",
                Description = "Yamaha MT-07, an 2022, putini kilometri.",
                Location = "Brasov",
                EndDate = now.AddMinutes(45),
                ImageUrl = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop",
            },
            new
            {
                Name = "Antique Oil Painting",
                StartPrice = 1800m,
                CurrentPrice = 1950m,
                Category = "Art & Collectibles",
                Owner = "george_v",
                Description = "Pictura in ulei, secolul XIX, rama originala.",
                Location = "Sibiu",
                EndDate = now.AddMinutes(8),
                ImageUrl = "https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800&auto=format&fit=crop",
            },
        };

        foreach (var def in seedItemDefs)
        {
            var existing = dbContext.AuctionItems.FirstOrDefault(i => i.Name == def.Name);
            if (existing == null)
            {
                dbContext.AuctionItems.Add(new Backend.Models.AuctionItem
                {
                    Name = def.Name,
                    StartPrice = def.StartPrice,
                    CurrentPrice = def.CurrentPrice,
                    CategoryId = categories[def.Category].id,
                    OwnerId = seededUsers[def.Owner].ID,
                    Description = def.Description,
                    Location = def.Location,
                    Status = Backend.Models.AuctionItem.StatusEnum.ActiveBid,
                    StartDate = now,
                    EndDate = def.EndDate,
                    ImageUrl = def.ImageUrl,
                });
            }
            else if (existing.ImageUrl != def.ImageUrl)
            {
                existing.ImageUrl = def.ImageUrl;
            }
        }

        dbContext.SaveChanges();
    }

    // Seed a few forum posts (some referencing the same items/users above,
    // so the search page's Forum tab has real cross-matching results).
    var seedPostDefs = new[]
    {
        ("mihai_p", "Selling my BMW M4 next week - AMA", "Getting ready to list my BMW M4 Competition on the marketplace, ask me anything about the car.", -2),
        ("george_v", "Best tips for photographing gold jewelry", "Sharing some tips on how to photograph a gold necklace so it sells faster.", -5),
        ("elena_r", "iPhone 15 Pro Max vs iPhone 14 Pro - worth the upgrade?", "Comparing camera and battery life before I put my iPhone up for auction.", -1),
        ("mihai_p", "Anyone collect vintage watches?", "Looking to connect with other Rolex and vintage watch collectors on BidSphere.", -7),
        ("ana_m", "How to stage a villa for auction photos", "Tips for making a modern villa with a pool look its best in listing photos.", -3),
    };

    foreach (var (owner, title, description, daysAgo) in seedPostDefs)
    {
        if (!dbContext.ForumPosts.Any(p => p.Title == title))
        {
            dbContext.ForumPosts.Add(new Backend.Models.ForumPost
            {
                UserId = seededUsers[owner].ID,
                Title = title,
                Description = description,
                Date = DateTime.UtcNow.AddDays(daysAgo),
            });
        }
    }

    dbContext.SaveChanges();
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
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PhoneNumber'
            )
            BEGIN
                ALTER TABLE [Users] ADD [PhoneNumber] nvarchar(max) NULL;
            END");
    }
    catch { }

    try
    {
        db.Database.ExecuteSqlRaw(@"
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
    END
");
    }
    catch { }
}


app.Run();