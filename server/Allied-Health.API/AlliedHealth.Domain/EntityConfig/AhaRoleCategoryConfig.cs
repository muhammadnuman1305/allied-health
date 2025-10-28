using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class AhaRoleCategoryConfig : IEntityTypeConfiguration<AhaRoleCategory>
    {
        public void Configure(EntityTypeBuilder<AhaRoleCategory> b)
        {
            b.ToTable("AhaRoleCategory");

            b.HasKey(x => x.Id);

            b.Property(x => x.Name)
                .HasMaxLength(250)
                .IsRequired();

            b.HasOne(x => x.Role)
                .WithMany(r => r.Categories)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(x => new { x.RoleId, x.Name }).IsUnique();
        }
    }
}
