using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class PatientOutcomeConfig : IEntityTypeConfiguration<PatientOutcome>
    {
        public void Configure(EntityTypeBuilder<PatientOutcome> b)
        {
            b.ToTable("PatientOutcome");

            b.HasKey(x => x.Id);

            b.Property(x => x.AdditionalNote).HasMaxLength(250);

            b.HasOne(x => x.Patient)
                .WithMany(p => p.Outcomes)
                .HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(x => x.PatientId);
        }
    }
}
