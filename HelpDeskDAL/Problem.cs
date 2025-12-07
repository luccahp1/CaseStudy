using ExercisesDAL;
using System;
using System.Collections.Generic;

namespace HelpDeskDAL;

public partial class Problem : HelpDeskEntity
{
    

    public string? Description { get; set; }



    public virtual ICollection<Call> Calls { get; set; } = new List<Call>();
}
