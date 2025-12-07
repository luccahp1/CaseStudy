using HelpDeskDAL;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HelpDeskDAL
{
    public class DepartmentDAO
    {
        readonly IRepository<Department> _repo;
        public DepartmentDAO()
        {
            _repo = new HelpdeskRepository<Department>();
        }

        public async Task<List<Department>> GetAll()
        {
            List<Department> allDepartments;
            try
            {
                HelpdeskContext _db = new();
                allDepartments = await _repo.GetAll();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return allDepartments;
        }



    }
}
