namespace AlliedHealth.Model.Entities
{
    public class AhaRoleCategory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = default!;            // varchar(250)

        public Guid RoleId { get; set; }                        // FK -> AhaRole.Id
        public AhaRole Role { get; set; } = default!;
    }
}
