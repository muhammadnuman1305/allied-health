
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Model.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class PatientConfig : IEntityTypeConfiguration<Patient>
    {
        public void Configure(EntityTypeBuilder<Patient> b)
        {
            b.ToTable("Patient");

            b.HasKey(x => x.UMRN);

            b.Property(x => x.FirstName).HasMaxLength(250).IsRequired();
            b.Property(x => x.LastName).HasMaxLength(250).IsRequired();
            b.Property(x => x.BedNumber).HasMaxLength(255);

            b.Property(x => x.Diagnosis).HasMaxLength(1000);
            b.Property(x => x.Notes).HasMaxLength(4000);
            b.Property(x => x.Goal).HasMaxLength(4000);

            b.Property(x => x.CreatedDate).HasDefaultValueSql("timezone('utc', now())");

            b.HasIndex(x => new { x.LastName, x.FirstName });
            b.HasIndex(x => x.PriorityId);

            // Relationships
            b.HasOne(x => x.Priority)
                .WithMany(p => p.Patients)
                .HasForeignKey(x => x.PriorityId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(x => x.ReferringAHPUser)
                .WithMany()
                .HasForeignKey(x => x.ReferringAHP)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(x => x.LastModifiedByUser)
                .WithMany()
                .HasForeignKey(x => x.LastModifiedBy)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
