import { supabase } from '../config/supabase';

function requireSchoolId(schoolId) {
  if (typeof schoolId !== 'string' || !schoolId.trim()) throw new Error('staff_school_required');
  return schoolId.trim();
}

async function call(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

export async function getStaffStudents(schoolId) {
  const data = await call('staff_list_students', { target_school_id: requireSchoolId(schoolId) });
  return Array.isArray(data) ? data : [];
}

export async function createStaffStudent(schoolId, student) {
  return call('staff_create_student', {
    target_school_id: requireSchoolId(schoolId),
    student_payload: {
      name: student?.name,
      class: student?.class,
      number: student?.number,
    },
  });
}

export async function renameStaffStudent(schoolId, studentId, name) {
  return call('staff_rename_student', {
    target_school_id: requireSchoolId(schoolId),
    target_student_id: studentId,
    new_name: name,
  });
}

export async function setStaffTranslatePermission(schoolId, studentId, permission) {
  return call('staff_set_translate_permission', {
    target_school_id: requireSchoolId(schoolId),
    target_student_id: studentId,
    new_permission: permission,
  });
}

export async function deleteStaffStudent(schoolId, studentId) {
  return call('staff_delete_student', {
    target_school_id: requireSchoolId(schoolId),
    target_student_id: studentId,
  });
}

export async function deleteStaffStudentsByClass(schoolId, className) {
  return call('staff_delete_students_by_class', {
    target_school_id: requireSchoolId(schoolId),
    target_class: className,
  });
}

export async function deleteAllStaffStudents(schoolId) {
  return call('staff_delete_all_students', { target_school_id: requireSchoolId(schoolId) });
}
