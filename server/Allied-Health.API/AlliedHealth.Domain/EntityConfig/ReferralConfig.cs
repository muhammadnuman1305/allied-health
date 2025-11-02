using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class ReferralConfig : IEntityTypeConfiguration<Referral>
    {
        public void Configure(EntityTypeBuilder<Referral> b)
        {
            b.ToTable("Referral");

            // PK
            b.HasKey(r => r.Id);

            // Properties
            b.Property(r => r.Diagnosis).HasMaxLength(250);
            b.Property(r => r.Goals).HasMaxLength(500);
            b.Property(r => r.Description).HasMaxLength(1000);

            b.Property(r => r.Priority).IsRequired();
            b.Property(r => r.Status).IsRequired();

            b.Property(r => r.CreatedDate)
                .HasDefaultValueSql("timezone('utc', now())");
            b.Property(r => r.ModifiedDate)
                .HasDefaultValueSql("timezone('utc', now())");

            b.Property(r => r.Hidden)
                .HasDefaultValue(false)
                .IsRequired();

            // Relationships
            b.HasOne(r => r.Patient)
                .WithMany(p => p.Referrals)
                .HasForeignKey(r => r.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(r => r.OriginDepartment)
                .WithMany()
                .HasForeignKey(r => r.OriginDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(r => r.DestinationDepartment)
                .WithMany()
                .HasForeignKey(r => r.DestinationDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Optional relationships to User (no navigation properties on Referral)
            b.HasOne<User>() // ReferringTherapist
                .WithMany()
                .HasForeignKey(r => r.ReferringTherapist)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne<User>() // CreatedBy
                .WithMany()
                .HasForeignKey(r => r.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne<User>() // ModifiedBy
                .WithMany()
                .HasForeignKey(r => r.ModifiedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Child collections
            b.HasMany(r => r.ReferralInterventions)
                .WithOne(ri => ri.Referral)
                .HasForeignKey(ri => ri.ReferralId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(r => r.Tasks)
                .WithOne(t => t.Referral!)
                .HasForeignKey(t => t.ReferralId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes for common queries
            b.HasIndex(r => new { r.PatientId, r.Status });
            b.HasIndex(r => new { r.OriginDepartmentId, r.DestinationDepartmentId });
            b.HasIndex(r => r.ReferringTherapist);
            b.HasIndex(r => r.Hidden);
        }
    }
}
