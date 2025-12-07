using HelpDeskDAL;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Threading.Tasks;

namespace HelpDeskDAL
{
    public class ProblemDAO
    {
        readonly IRepository<Problem> _repo;

        public ProblemDAO()
        {
            _repo = new HelpdeskRepository<Problem>();
        }

        public async Task<List<Problem>> GetAll()
        {
            try
            {
                return await _repo.GetAll();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name} {MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
        }

        public async Task<Problem?> GetByDescription(string description)
        {
            try
            {
                return await _repo.GetOne(p => p.Description == description);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name} {MethodBase.GetCurrentMethod()!.Name}: {ex.Message}");
                throw;
            }
        }
    }
}
