using HelpDeskDAL;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Threading.Tasks;

namespace HelpdeskViewModels
{
    public class ProblemViewModel
    {
        private readonly ProblemDAO _dao;

        public int? Id { get; set; }
        public string? Description { get; set; }
        public string? Timer { get; set; }

        public ProblemViewModel()
        {
            _dao = new ProblemDAO();
        }

       
        public async Task<List<ProblemViewModel>> GetAll()
        {
            List<ProblemViewModel> vms = new();

            try
            {
                List<Problem> problems = await _dao.GetAll();

                foreach (Problem p in problems)
                {
                    vms.Add(new ProblemViewModel
                    {
                        Id = p.Id,
                        Description = p.Description,
                        Timer = Convert.ToBase64String(p.Timer!)
                    });
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name} {MethodBase.GetCurrentMethod()!.Name} {ex.Message}");
                throw;
            }

            return vms;
        }

       
        public async Task<ProblemViewModel?> GetByDescription(string description)
        {
            try
            {
                Problem? p = await _dao.GetByDescription(description);
                if (p == null) return null;

                return new ProblemViewModel
                {
                    Id = p.Id,
                    Description = p.Description,
                    Timer = Convert.ToBase64String(p.Timer!)
                };
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name} {MethodBase.GetCurrentMethod()!.Name} {ex.Message}");
                throw;
            }
        }
    }
}
