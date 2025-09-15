using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AlliedHealth.Model.Entities;

namespace AlliedHealth.Domain.EntityConfigs
{
    public class UserConfig : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> b)
        {
            b.ToTable("User");

            b.HasKey(x => x.Id);

            b.Property(x => x.FirstName).HasMaxLength(250).IsRequired();
            b.Property(x => x.LastName).HasMaxLength(250).IsRequired();
            b.Property(x => x.Username).HasMaxLength(250).IsRequired();
            b.Property(x => x.Email).HasMaxLength(250).IsRequired();
            b.Property(x => x.Password).HasMaxLength(250).IsRequired();
            b.Property(x => x.Hidden);

            b.HasIndex(x => x.Username).IsUnique();
            b.HasIndex(x => x.Email).IsUnique();
        }
    }
}
