using Microsoft.EntityFrameworkCore;
using AlliedHealth.Domain.Entities;
using Task = AlliedHealth.Domain.Entities.Task;

namespace AlliedHealth.Domain
{
    public class AlliedHealthDbContext : DbContext
    {
        public AlliedHealthDbContext(DbContextOptions<AlliedHealthDbContext> options)
            : base(options) { }

        // Core entities
        public DbSet<PatientOutcome> PatientOutcomes => Set<PatientOutcome>();
        public DbSet<Priority> Priorities => Set<Priority>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Ward> Wards => Set<Ward>();
        public DbSet<WardDeptCoverage> WardDeptCoverages => Set<WardDeptCoverage>();
        public DbSet<AhaRole> AhaRoles => Set<AhaRole>();
        public DbSet<AhaRoleCategory> AhaRoleCategories => Set<AhaRoleCategory>();

        // Newly added entities
        public DbSet<Task> Tasks => Set<Task>();
        public DbSet<TaskIntervention> TaskInterventions => Set<TaskIntervention>();
        public DbSet<Intervention> Interventions => Set<Intervention>();
        public DbSet<Specialty> Specialties => Set<Specialty>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Automatically apply all IEntityTypeConfiguration<T> classes in this assembly
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AlliedHealthDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }
    }
}
