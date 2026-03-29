using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class InterventionComponentConfig : IEntityTypeConfiguration<InterventionComponent>
    {
        public void Configure(EntityTypeBuilder<InterventionComponent> b)
        {
            b.ToTable("InterventionComponent");

            b.HasKey(x => x.Id);

            b.Property(x => x.Value)
                .HasMaxLength(300)
                .IsRequired();

            b.HasOne(x => x.Intervention)
                .WithMany(i => i.Components)
                .HasForeignKey(x => x.InterventionId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.ComponentType)
                .WithMany(ct => ct.InterventionComponents)
                .HasForeignKey(x => x.ComponentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => x.InterventionId);
            b.HasIndex(x => x.ComponentTypeId);
        }
    }
}
