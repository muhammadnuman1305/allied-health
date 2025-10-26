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

            // Primary Key
            b.HasKey(x => x.Id);

            // Properties
            b.Property(x => x.FullName)
                .HasMaxLength(250)
                .IsRequired();

            b.Property(x => x.DateOfBirth)
                .HasColumnType("date"); // Maps DateOnly to SQL date

            b.Property(x => x.Gender)
                .IsRequired();

            b.Property(x => x.PrimaryPhone)
                .HasMaxLength(20)
                .IsRequired();

            b.Property(x => x.EmergencyContactName)
                .HasMaxLength(150)
                .IsRequired(false);

            b.Property(x => x.EmergencyContactPhone)
                .HasMaxLength(20)
                .IsRequired(false);

            b.Property(x => x.CreatedDate)
                .HasDefaultValueSql("timezone('utc', now())");

            b.Property(x => x.LastModifiedDate)
                .HasDefaultValueSql("timezone('utc', now())");

            // Relationships
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
