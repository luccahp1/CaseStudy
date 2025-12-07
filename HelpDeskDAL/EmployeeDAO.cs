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
    public class EmployeeDAO
    {
        readonly IRepository<Employee> _repo;
        public EmployeeDAO()
        {
            _repo = new HelpdeskRepository<Employee>();
        }

        public async Task<Employee> GetByEmail(string email)
        {
            Employee? selectedEmployee;
            try
            {
                HelpdeskContext _db = new();
                selectedEmployee = await _repo.GetOne(emp => emp.Email == email);

            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee!;
        }

        public async Task<Employee> GetByLastname(string name)
        {
            Employee? selectedEmployee;
            try
            {
               HelpdeskContext _db = new();
                selectedEmployee = await _repo.GetOne(emp => emp.LastName == name);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee!;
        }

        public async Task<Employee> GetById(int id)
        {
            Employee? selectedEmployee;
            try
            {
                HelpdeskContext _db = new();
                selectedEmployee = await _repo.GetOne(emp => emp.Id == id);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee!;
        }

        public async Task<List<Employee>> GetAll()
        {
            List<Employee> allEmployees;
            try
            {
                HelpdeskContext _db = new();
                allEmployees = await _repo.GetAll();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return allEmployees;
        }

        public async Task<int> Add(Employee newEmployee)
        {
            try
            {
                HelpdeskContext _db = new();
                await _repo.Add(newEmployee);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return newEmployee.Id;
        }

            public async Task<UpdateStatus> Update(Employee updatedEmployee)
            {
            UpdateStatus status;
            try
                {
                    status = await _repo.Update(updatedEmployee);
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
            int EmployeesDeleted = -1;
            try
            {
                HelpdeskContext _db = new();
                Employee? selectedEmployee = await _db.Employees.FirstOrDefaultAsync(emp => emp.Id == id);
                EmployeesDeleted = await _repo.Delete((int)id!); // returns # of rows removed
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return EmployeesDeleted;
        }


        public async Task<Employee> GetByPhoneNumber(string phoneNumber)
        {
            Employee? selectedEmployee;
            try
            {
                HelpdeskContext _db = new();
                selectedEmployee = await _repo.GetOne(emp => emp.PhoneNo == phoneNumber);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
            }
            return selectedEmployee!;
        }


    }
}
