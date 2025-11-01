using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class SpecialtyConfig : IEntityTypeConfiguration<Specialty>
    {
        public void Configure(EntityTypeBuilder<Specialty> b)
        {
            b.ToTable("Specialty");

            // Primary Key
            b.HasKey(x => x.Id);

            // Properties
            b.Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();

            b.Property(x => x.Description)
                .HasMaxLength(500);

            // Audit Fields
            b.Property(x => x.CreatedDate)
                .IsRequired();

            b.Property(x => x.CreatedBy)
                .IsRequired();

            b.Property(x => x.ModifiedDate)
                .IsRequired(false);

            b.Property(x => x.ModifiedBy)
                .IsRequired(false);

            b.Property(x => x.Hidden)
                .HasDefaultValue(false)
                .IsRequired();

            // Relationships
            b.HasMany(x => x.Interventions)
                .WithOne(i => i.Specialty)
                .HasForeignKey(i => i.SpecialtyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes (optional for performance and filtering)
            b.HasIndex(x => x.Name).IsUnique();  // Ensures each specialty name is distinct
            b.HasIndex(x => x.Hidden);
        }
    }
}
