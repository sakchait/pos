using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Pos.Application;
using Pos.Application.Repositories;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;
using Pos.Infrastructure.Services;
using Presentation.Api.Authorization;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Build configuration (keep existing ordering and Azure App Configuration extension)
        builder.Configuration
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args)
            .Build();

        // Options
        builder.Services.Configure<ApiKeySettings>(builder.Configuration.GetSection("ApiKeySettings"));

        // API Versioning / Explorer
        builder.Services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new HeaderApiVersionReader("X-Api-Version")
            );
        })
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        // Resolve secrets (async) and configure DbContext safely
        var loggerFactory = LoggerFactory.Create(lb => lb.AddConsole());
        var tempLogger = loggerFactory.CreateLogger("Startup");
        var dbConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(dbConnectionString)
                   .ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

        // Application services and DI registrations
        builder.Services.AddApplicationServices();
        builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        builder.Services.AddSingleton<IMaintananceService, MaintananceService>();
        builder.Services.AddScoped<IAntiFraudAnalysisService, AntiFraudAnalysisService>();
        builder.Services.AddScoped<IBasketAnalysisService, BasketAnalysisService>();
        builder.Services.AddScoped<IFifoCostingService, FifoCostingService>();
        builder.Services.AddScoped<IReportsService, ReportsService>();
        builder.Services.AddScoped<IShiftGeneratorService, ShiftGeneratorService>();
        builder.Services.AddScoped<IShiftSwapService, ShiftSwapService>();
        builder.Services.AddScoped<IVendorPurchaseService, VendorPurchaseService>();
        builder.Services.AddScoped<ISyncService, SyncService>();

        builder.Services.AddHealthChecks();
        builder.Services.AddControllers(options =>
        {
            options.Filters.Add<ApiKeyFilter>();
        });
        builder.Services.AddEndpointsApiExplorer();

        // Swagger: generate one document per API version
        builder.Services.AddSwaggerGen(options =>
        {
            var provider = builder.Services.BuildServiceProvider().GetRequiredService<IApiVersionDescriptionProvider>();
            foreach (var description in provider.ApiVersionDescriptions)
            {
                options.SwaggerDoc(description.GroupName, new OpenApiInfo
                {
                    Title = "POS API",
                    Version = description.ApiVersion.ToString(),
                    Description = description.IsDeprecated ? "This API version has been deprecated." : "POS API."
                });
            }

            options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
            {
                Name = "x-functions-key",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Description = "API key authorization via x-functions-key header."
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "ApiKey" }
                    },
                    Array.Empty<string>()
                }
            });
        });
     
        var app = builder.Build();

        //if (app.Environment.IsDevelopment())
        //{
        //    using var scope = app.Services.CreateScope();
        //    var services = scope.ServiceProvider;
        //    var logger2 = services.GetRequiredService<ILogger<Program>>();

        //    try
        //    {
        //        var db = services.GetRequiredService<ApplicationDbContext>();
        //        logger2.LogInformation("Applying EF Core migrations (Development)...");
        //        await db.Database.MigrateAsync();
        //        logger2.LogInformation("EF Core migrations applied and database seeded.");
        //    }
        //    catch (Exception ex)
        //    {
        //        logger2.LogError(ex, "Error while migrating or seeding the database on startup.");
        //        throw;
        //    }
        //}
        // Middleware pipeline
        if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // Security and routing
        app.UseHttpsRedirection();
        app.UseRouting();
        //app.UseAuthentication();
        app.UseAuthorization();

        // Observability / health
        app.MapHealthChecks("/healthz");
        app.MapControllers();

        // Startup logs
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("POS API starting ({env})", app.Environment.EnvironmentName);

        app.Run();
    }
}