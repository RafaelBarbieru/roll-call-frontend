$(document).ready(function () {

  const divLogin = $("#div-login")
  const divTeacher = $("#div-teacher")
  const divStudent = $("#div-student")
  const divStudentChecked = $("#div-student-checked")
  const email = $('#t_email')
  const password = $('#t_password')
  var userId
  var codeObject = {}

  $("#b_login").click(() => {
    login().then(response => {

      if (response.userRole === 'TEACHER') {
        userId = response.userDetails.id
        getSubjects(response.userDetails.id).then((res) => {
          $(divLogin).hide()
          $(divTeacher).show()
          fillSubjects(res, true)
        })
      }

      else if (response.userRole === 'STUDENT') {
        userId = response.userDetails.id
        getSubjects(response.userDetails.id).then((res) => {
          $(divLogin).hide()
          $(divStudent).show()
          fillSubjects(res, false)
        })

      }

      else {
        alert(response.error)
      }
    })

  })

  $("#b_generate").click(() => {
    const subjectId = $("#t_subjects_teacher").val()
    const time = $("#t_expiry").val()
    if (time >= 5 && time <= 240) {
      postGenerate(userId, subjectId, time).then(res => {
        codeObject = {
          subjectId: subjectId,
          subjectName: res.subjectName,
          code: res.code,
          time: time
        }
        $("#l_generatedSubject").text(codeObject.subjectName)
        $("#l_code").text(codeObject.code)
        $("#l_expiration").text(codeObject.time)
        $("#div-teacher").hide()
        $("#div-generated").show()
      })
    } else {
      alert("The expiry time should be between 5 and 240 minutes")
    }

  })

  $("#b_mark").click(() => {
    const code = $("#t_code").val()
    postCheck(code).then(res => {
      if (res.error) {
        alert("The code is not correct")
      } else {
        $(divStudent).hide()
        $(divStudentChecked).show()
      }
    })
  })

  $(".b_logout").click(() => {
    goLogin()
  })

  function goLogin() {
    $(divLogin).show()
    $(divTeacher).hide()
    $(divStudent).hide()
    $(divStudentChecked).hide()
    $("#t_email").val('')
    $("#t_password").val('')
  }

  $("#b_back_teacher").click(() => {
    goLogin()
  })

  async function login() {
    const url = "https://schoolrollcall.herokuapp.com/login"
    const data = {
      email: email.val(),
      password: password.val()
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async function getSubjects(userId) {
    const response = await fetch(`https://schoolrollcall.herokuapp.com/subjects/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    return response.json()
  }

  function fillSubjects(subjects, isTeacher) {
    subjects.forEach(subject => {
      if (isTeacher) {
        $("#t_subjects_teacher").append($("<option />").val(subject.id).text(subject.name));
      } else {
        $("#t_subjects_student").append($("<option />").val(subject.id).text(subject.name));
      }
    })
  }

  async function postGenerate(teacherId, subjectId, time) {
    const response = await fetch('https://schoolrollcall.herokuapp.com/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: teacherId,
        expirationTime: time,
        subjectId: subjectId
      })
    })
    return response.json()
  }

  async function postCheck(code) {
    const response = await fetch('https://schoolrollcall.herokuapp.com/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        code: code
      })
    })
    return response.json()
  }

})
