using AlliedHealth.Domain;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using AlliedHealth.Service.Implementation;
using AlliedHealth.Service.Implementation.Authentication;
using System.Security.Principal;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AlliedHealth.Service.Contract.AHA;
using AlliedHealth.Service.Implementation.AHA;

var builder = WebApplication.CreateBuilder(args);

// Register EF DbContext with connection
var connection = builder.Configuration.GetConnectionString("PostgreConnection");
builder.Services.AddDbContext<AlliedHealthDbContext>(opt =>
    opt.UseNpgsql(connection, npgsql => npgsql.EnableRetryOnFailure()));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IPrincipal>(provider =>
{
    var httpContextAccessor = provider.GetRequiredService<IHttpContextAccessor>();
    return httpContextAccessor.HttpContext?.User ?? new ClaimsPrincipal();
});

// Add services to the container.
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IWardService, WardService>();
builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
builder.Services.AddScoped<IInterventionService, InterventionService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
builder.Services.AddScoped<IInterventionService, InterventionService>();
builder.Services.AddScoped<IReferralService, ReferralService>();

// AHA Services
builder.Services.AddScoped<IAHAPatientService, AHAPatientService>();
builder.Services.AddScoped<IAHATaskService, AHATaskService>();

builder.Services.AddScoped<IUtilityService, UtilityService>();

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Get JWT settings from configuration
    var jwtKey = builder.Configuration["JwtSettings:Key"];
    var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
    var jwtAudience = builder.Configuration["JwtSettings:Audience"];

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };

    // Optional: Add events for debugging
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully");
            return Task.CompletedTask;
        }
    };
});

// Add Authorization
builder.Services.AddAuthorization();

// Setup Controllers and OData
builder.Services.AddControllers(options =>
{
    //options.Filters.Add<ODataCountActionFilter>();
}).AddOData(options => options.Select().Filter().OrderBy().SetMaxTop(null).Count().Expand());

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add CORS service
//var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowAll", policy =>
//        policy.WithOrigins(allowedOrigins)
//              .AllowAnyHeader()
//              .AllowAnyMethod());
//});

builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AlliedHealthDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
} 
else
{
    app.UseHttpsRedirection();
}

//app.UseCors("AllowAll");
app.UseCors();

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok("OK"));

app.Run();