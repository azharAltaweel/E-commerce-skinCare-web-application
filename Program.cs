//using E_commerce_Website__Skincare_.Data;
//using E_commerce_Website__Skincare_.Models;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;

//var builder = WebApplication.CreateBuilder(args);

//// Connection
//var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
//    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

//builder.Services.AddDbContext<ApplicationDbContext>(options =>
//    options.UseSqlServer(connectionString));

//builder.Services.AddDatabaseDeveloperPageExceptionFilter();

////  Identity  + Roles
//builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
//{
//    options.SignIn.RequireConfirmedAccount = false;
//})
//.AddEntityFrameworkStores<ApplicationDbContext>()
//.AddDefaultTokenProviders();

//builder.Services.AddControllersWithViews();


//builder.Services.AddRazorPages();
//var app = builder.Build();


//// Create Roles + Admin User
//using (var scope = app.Services.CreateScope())
//{
//    var services = scope.ServiceProvider;

//    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
//    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

//    string[] roles = { "Admin", "User" };

//    foreach (var role in roles)
//    {
//        if (!await roleManager.RoleExistsAsync(role))
//            await roleManager.CreateAsync(new IdentityRole(role));
//    }

//    // Admin User
//    var adminEmail = "admin@site.com";
//    var admin = await userManager.FindByEmailAsync(adminEmail);

//    if (admin == null)
//    {
//        var user = new ApplicationUser
//        {
//            UserName = adminEmail,
//            Email = adminEmail,
//            FullName = "Admin"
//        };

//        await userManager.CreateAsync(user, "Admin@123");
//        await userManager.AddToRoleAsync(user, "Admin");
//    }
//}


//// Middleware
//if (app.Environment.IsDevelopment())
//{
//    app.UseMigrationsEndPoint();
//}
//else
//{
//    app.UseExceptionHandler("/Home/Error");
//    app.UseHsts();
//}

//app.UseHttpsRedirection();
//app.UseStaticFiles();

//app.UseRouting();

//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller=Home}/{action=Index}/{id?}");

//app.MapRazorPages();

//app.Run();





using E_commerce_Website__Skincare_.Data;
using E_commerce_Website__Skincare_.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Connection - Updated with EnableRetryOnFailure
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        // This fixes the transient failure mentioned in the error message
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    }));


builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// Identity + Roles
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

// Configure session state services
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Create Roles + Admin User
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roles = { "Admin", "User" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Admin User
        var adminEmail = "admin@site.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);

        if (admin == null)
        {
            var user = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Admin"
            };

            var result = await userManager.CreateAsync(user, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "Admin");
            }
        }
    }
    catch (Exception ex)
    {
        // Log the error if seeding fails during startup
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=User}/{action=HomePage}");

app.MapRazorPages();

app.Run();