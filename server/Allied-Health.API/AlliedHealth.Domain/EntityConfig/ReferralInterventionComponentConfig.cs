using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class ReferralInterventionComponentConfig : IEntityTypeConfiguration<ReferralInterventionComponent>
    {
        public void Configure(EntityTypeBuilder<ReferralInterventionComponent> b)
        {
            b.ToTable("ReferralInterventionComponent");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedOnAdd();

            b.Property(x => x.Value).IsRequired().HasMaxLength(300);

            // FK → ReferralIntervention (cascade: deleting the intervention row removes its components)
            b.HasOne(x => x.ReferralIntervention)
             .WithMany(ri => ri.SelectedComponents)
             .HasForeignKey(x => x.ReferralInterventionId)
             .OnDelete(DeleteBehavior.Cascade);

            // FK → ComponentType (restrict: component types cannot be deleted while in use)
            b.HasOne(x => x.ComponentType)
             .WithMany(ct => ct.ReferralInterventionComponents)
             .HasForeignKey(x => x.ComponentTypeId)
             .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
