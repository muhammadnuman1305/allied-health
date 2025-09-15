using Microsoft.EntityFrameworkCore;
using AlliedHealth.Model.Entities;

namespace AlliedHealth.Domain
{
    public class AlliedHealthDbContext : DbContext
    {
        public AlliedHealthDbContext(DbContextOptions<AlliedHealthDbContext> options)
            : base(options) { }

        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<PatientOutcome> PatientOutcomes => Set<PatientOutcome>();
        public DbSet<Priority> Priorities => Set<Priority>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Ward> Wards => Set<Ward>();
        public DbSet<AhaRole> AhaRoles => Set<AhaRole>();
        public DbSet<AhaRoleCategory> AhaRoleCategories => Set<AhaRoleCategory>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AlliedHealthDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }
    }
}
