// EntityConfigs/ReferralInterventionConfig.cs
using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class ReferralInterventionConfig : IEntityTypeConfiguration<ReferralIntervention>
    {
        public void Configure(EntityTypeBuilder<ReferralIntervention> b)
        {
            b.ToTable("ReferralIntervention");

            b.HasKey(x => x.Id);
            b.Property(x => x.Id).ValueGeneratedOnAdd();

            b.Property(x => x.ReferralId).IsRequired();
            b.Property(x => x.InterventionId).IsRequired();

            // FK → Referral
            b.HasOne(x => x.Referral)
             .WithMany(r => r.ReferralInterventions)
             .HasForeignKey(x => x.ReferralId)
             .OnDelete(DeleteBehavior.Cascade);

            // FK → Intervention (no inverse nav required)
            b.HasOne(x => x.Intervention)
             .WithMany() // or .WithMany(i => i.ReferralInterventions) if you have it
             .HasForeignKey(x => x.InterventionId)
             .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate (Referral, Intervention)
            b.HasIndex(x => new { x.ReferralId, x.InterventionId }).IsUnique();
        }
    }
}
