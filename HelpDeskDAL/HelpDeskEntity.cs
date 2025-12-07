using System.ComponentModel.DataAnnotations;
namespace ExercisesDAL
{
    public class HelpDeskEntity
    {
        public int Id { get; set; }
        [Timestamp]
        public byte[]? Timer { get; set; }
    }
}
