using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class DepartmentConfig : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> b)
        {
            b.ToTable("Department");

            // Primary Key
            b.HasKey(x => x.Id);

            // Basic Fields
            b.Property(x => x.Name)
                .HasMaxLength(200)
                .IsRequired();

            b.Property(x => x.Purpose)
                .HasMaxLength(500)
                .IsRequired();

            b.Property(x => x.Code)
                .HasMaxLength(50)
                .IsRequired();

            b.Property(x => x.Description)
                .HasMaxLength(1000)
                .IsRequired();

            b.Property(x => x.ContactNumber)
                .HasMaxLength(50)
                .IsRequired();

            b.Property(x => x.EmailAddress)
                .HasMaxLength(250)
                .IsRequired();

            // Staff & Settings
            b.Property(x => x.DefaultTaskPriority)
                .IsRequired();

            b.Property(x => x.OperatingFrom)
                .IsRequired();

            b.Property(x => x.OperatingTo)
                .IsRequired();

            // Auditing Fields
            b.Property(x => x.CreatedDate)
                .IsRequired();

            b.Property(x => x.Hidden)
                .HasDefaultValue(false);

            // Relationships -----------------------------------

            // Department → Specialty (Many-to-One)
            //b.HasOne(x => x.Specialty)
            //    .WithMany()
            //    .HasForeignKey(x => x.SpecialtyId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // Department → User (DeptHead) (One-to-One or Many-to-One depending on your logic)
            b.HasOne(x => x.DeptHeadUser)
                .WithMany() // if a user can head multiple departments, keep WithMany()
                .HasForeignKey(x => x.DeptHeadId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.HasMany(x => x.AlliedAssistants)
                .WithOne(x => x.Department)
                .HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            b.HasIndex(x => x.Code).IsUnique();
            b.HasIndex(x => x.Name);
        }
    }
}
