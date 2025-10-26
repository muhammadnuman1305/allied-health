using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Model.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class InterventionConfig : IEntityTypeConfiguration<Intervention>
    {
        public void Configure(EntityTypeBuilder<Intervention> b)
        {
            b.ToTable("Intervention");

            b.HasKey(x => x.InterventionId);

            b.Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();

            b.HasOne(x => x.Specialty)
                .WithMany(s => s.Interventions)
                .HasForeignKey(x => x.SpecialtyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
