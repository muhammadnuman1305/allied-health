namespace AlliedHealth.Domain.Entities
{
    public class WardDeptCoverage
    {
        public Guid WardId { get; set; }
        public Guid DepartmentId { get; set; }

        public Ward Ward { get; set; } = default!;
        public Department Department { get; set; } = default!;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}