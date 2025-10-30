using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class WardConfig : IEntityTypeConfiguration<Ward>
    {
        public void Configure(EntityTypeBuilder<Ward> b)
        {
            b.ToTable("Ward");

            // Primary Key
            b.HasKey(x => x.Id);

            // Basic Fields
            b.Property(x => x.Name)
                .HasMaxLength(250)
                .IsRequired();

            b.Property(x => x.Code)
                .HasMaxLength(50)
                .IsRequired();

            b.Property(x => x.Location)
                .HasMaxLength(250)
                .IsRequired();

            b.Property(x => x.BedCount)
                .IsRequired();

            b.Property(x => x.Description)
                .HasMaxLength(1000);

            // Auditing defaults
            b.Property(x => x.Hidden).HasDefaultValue(false);
            b.Property(x => x.CreatedDate).IsRequired();

            // Default Department (many-to-one)
            b.HasOne(x => x.DefaultDepartment)
                .WithMany() // Department can be default for many wards
                .HasForeignKey(x => x.DefaultDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            b.HasIndex(x => x.Name).IsUnique();
            b.HasIndex(x => x.Code).IsUnique();
        }
    }
}
