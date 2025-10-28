using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class SpecialtyConfig : IEntityTypeConfiguration<Specialty>
    {
        public void Configure(EntityTypeBuilder<Specialty> b)
        {
            b.ToTable("Specialty");

            b.HasKey(x => x.SpecialtyId);

            b.Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();
        }
    }
}
