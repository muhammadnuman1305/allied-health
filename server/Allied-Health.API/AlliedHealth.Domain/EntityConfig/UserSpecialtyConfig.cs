using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class UserSpecialtyConfig : IEntityTypeConfiguration<UserSpecialty>
    {
        public void Configure(EntityTypeBuilder<UserSpecialty> b)
        {
            b.ToTable("UserSpecialty");

            b.HasKey(x => new { x.UserId, x.SpecialtyId });

            b.Property(x => x.CreatedDate)
                .HasDefaultValueSql("(now() at time zone 'utc')")
                .IsRequired();

            // Relationships
            b.HasOne(x => x.User)
                .WithMany(u => u.UserSpecialties)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Specialty)
                .WithMany(s => s.UserSpecialties)
                .HasForeignKey(x => x.SpecialtyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}