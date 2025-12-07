using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Threading.Tasks;

namespace HelpDeskDAL
{
    public class CallDAO
    {
        private readonly IRepository<Call> _repo;

        public CallDAO()
        {
            _repo = new HelpdeskRepository<Call>();
        }

        public async Task<List<Call>> GetAll()
        {
            List<Call> allCalls;
            try
            {
                HelpdeskContext _db = new();
                allCalls = await _repo.GetAll();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return allCalls;
        }

        public async Task<Call> GetById(int id)
        {
            Call? selectedCall;
            try
            {
                HelpdeskContext _db = new();
                selectedCall = await _repo.GetOne(c => c.Id == id);
                
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedCall!;
        }

        public async Task<int> Add(Call newCall)
        {
            try
            {
                HelpdeskContext _db = new();
                await _repo.Add(newCall);
            }
            catch (Exception ex)
            {
               Debug.WriteLine("Problem in " + GetType().Name + " " +
               MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
               throw;
            }
            return newCall.Id;
        }

        public async Task<UpdateStatus> Update(Call call)
        {
            UpdateStatus status;
            try
            {
                status = await _repo.Update(call);
            }
            catch (DbUpdateConcurrencyException)
            {
                status = UpdateStatus.Stale;
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return status;
        }


        

        public async Task<int> Delete(int? id)
        {
            int CallsDeleted = -1;
            try
            {
                HelpdeskContext _db = new();
                Call? selectedCall = await _db.Calls.FirstOrDefaultAsync(call => call.Id == id);
                _db.Calls.Remove(selectedCall!);
                CallsDeleted = await _repo.Delete((int)id!); 
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Problem in {GetType().Name} {MethodBase.GetCurrentMethod()!.Name} {ex.Message}");
                throw;
            }
            return CallsDeleted;
        }
    }
}
