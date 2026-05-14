using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class VacationRequestConfig : IEntityTypeConfiguration<VacationRequest>
    {
        public void Configure(EntityTypeBuilder<VacationRequest> b)
        {
            b.ToTable("VacationRequest");

            b.HasKey(x => x.Id);

            b.Property(x => x.Id).ValueGeneratedOnAdd();

            b.Property(x => x.AhaUserId).IsRequired();

            b.Property(x => x.StartDate)
                .HasColumnType("date")
                .IsRequired();

            b.Property(x => x.EndDate)
                .HasColumnType("date")
                .IsRequired();

            b.Property(x => x.Reason)
                .IsRequired()
                .HasMaxLength(1000);

            b.Property(x => x.Status).IsRequired();

            b.Property(x => x.SubmittedDate).IsRequired();

            b.Property(x => x.ReviewedById);

            b.Property(x => x.ReviewedDate);

            b.Property(x => x.RejectionReason).HasMaxLength(500);

            b.HasOne(x => x.AhaUser)
                .WithMany()
                .HasForeignKey(x => x.AhaUserId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.ReviewedBy)
                .WithMany()
                .HasForeignKey(x => x.ReviewedById)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
