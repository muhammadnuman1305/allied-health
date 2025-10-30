using AlliedHealth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class WardDeptCoverageConfig : IEntityTypeConfiguration<WardDeptCoverage>
    {
        public void Configure(EntityTypeBuilder<WardDeptCoverage> b)
        {
            b.ToTable("WardDeptCoverage");

            b.HasKey(x => new { x.WardId, x.DepartmentId });

            b.HasOne(x => x.Ward)
                .WithMany(w => w.DepartmentCoverages)
                .HasForeignKey(x => x.WardId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Department)
                .WithMany()
                .HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
