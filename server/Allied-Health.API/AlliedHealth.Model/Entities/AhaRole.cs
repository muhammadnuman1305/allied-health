using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlliedHealth.Model.Entities
{
    public class AhaRole
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = default!;            // varchar(250)

        public ICollection<AhaRoleCategory> Categories { get; set; } = new List<AhaRoleCategory>();
    }
}
