using ExercisesDAL;
using System;
using System.Collections.Generic;

namespace HelpDeskDAL;

public partial class Department : HelpDeskEntity
{
   

    public string? DepartmentName { get; set; }

   

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
