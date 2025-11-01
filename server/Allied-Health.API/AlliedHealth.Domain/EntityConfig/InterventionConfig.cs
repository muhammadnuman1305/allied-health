using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class InterventionConfig : IEntityTypeConfiguration<Intervention>
    {
        public void Configure(EntityTypeBuilder<Intervention> b)
        {
            b.ToTable("Intervention");

            // Primary Key
            b.HasKey(x => x.Id);

            // Properties
            b.Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();

            b.Property(x => x.Description)
                .HasMaxLength(500);

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
            b.HasOne(x => x.Specialty)
                .WithMany(s => s.Interventions)
                .HasForeignKey(x => x.SpecialtyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes (optional but recommended for performance)
            b.HasIndex(x => x.SpecialtyId);
            b.HasIndex(x => x.Name).IsUnique();
            b.HasIndex(x => x.Hidden);
        }
    }
}
