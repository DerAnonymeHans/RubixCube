using RubixCubeBackend.Features.Solver;
using RubixCubeBackend.Features.Solver.Contracts;
using RubixCubeBackend.Features.Solver.TwoPhaseSolver;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ISolvingMethod, TwoPhaseSolverMethod>();
builder.Services.AddSingleton<SolverService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "dev", policy =>
    {
        policy.WithOrigins("http://localhost:8080").AllowAnyHeader().AllowAnyMethod();
    });
    options.AddPolicy(name: "prod", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(app.Environment.IsDevelopment() ? "dev" : "prod");

app.UseAuthorization();

app.MapControllers();

app.Run();
