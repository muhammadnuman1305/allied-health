using System.ComponentModel.DataAnnotations.Schema;

namespace AlliedHealth.Domain.Entities
{
    public class Ward
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        // Basic Info
        public string Name { get; set; } = default!;
        public string Code { get; set; } = default!;
        public string Location { get; set; } = default!;
        public int BedCount { get; set; }
        public string? Description { get; set; }

        // Default Department (Many-to-One)
        public Guid? DefaultDepartmentId { get; set; }
        public Department? DefaultDepartment { get; set; }

        // Coverage Departments (Many-to-Many)
        public ICollection<WardDeptCoverage> DepartmentCoverages { get; set; } = new List<WardDeptCoverage>();

        // Auditing
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public Guid? ModifiedBy { get; set; }
        public bool Hidden { get; set; } = false;
    }
}
