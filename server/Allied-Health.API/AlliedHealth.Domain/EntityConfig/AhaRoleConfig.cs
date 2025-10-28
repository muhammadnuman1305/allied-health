using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class AhaRoleConfig : IEntityTypeConfiguration<AhaRole>
    {
        public void Configure(EntityTypeBuilder<AhaRole> b)
        {
            b.ToTable("AhaRole");

            b.HasKey(x => x.Id);

            b.Property(x => x.Name)
                .HasMaxLength(250)
                .IsRequired();

            b.HasIndex(x => x.Name).IsUnique();
        }
    }
}
