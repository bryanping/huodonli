const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}



function convertToStarsArray(stars) {
  var num = stars.toString().substring(0, 1);
  var array = [];
  for (var i = 1; i <= 5; i++) {
    if (i <= num) {
      array.push(1);
    }
    else {
      array.push(0);
    }
  }
  return array;
}

function http(url, callBack) {
  wx.request({
    url: url,
    method: 'GET',
    header: {
      "Content-Type": "json"
    },
    success: function (res) {
      callBack(res.data);
    },
    fail: function (error) {
      console.log(error)
    }
  })
}

function convertToCastString(casts) {
  var castsjoin = "";
  for (var idx in casts) {
    castsjoin = castsjoin + casts[idx].name + " / ";
  }
  return castsjoin.substring(0, castsjoin.length - 2);
}

function convertToCastInfos(casts) {
  var castsArray = []
  for (var idx in casts) {
    var cast = {
      img: casts[idx].avatars ? casts[idx].avatars.large : "",
      name: casts[idx].name
    }
    castsArray.push(cast);
  }
  return castsArray;
}

function uuid(){
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function checkTime(i, reverse) {
  if(reverse){
    i = parseInt(i);
    return i;
  } else {
    return (i < 10) ? "0" + i : i;
  }
}

function shatterDate(d){
  let date = new Date(d);
  return {
    Y: date.getFullYear(),
    M: this.checkTime(date.getMonth() + 1),
    D: date.getDate(),
    W: date.getDay(),
  }
}

function calculateHowLong(start_time, end_time){
  let sStart = start_time.split(':');
  let sEnd = end_time.split(':');

  let startTimeHourse = parseInt(sStart[0]);
  let startTimeMinutes = parseInt(sStart[1]);

  let endTimeHourse = parseInt(sEnd[0]);
  let endTimeMinutes = parseInt(sEnd[1]);

  let differenceHourse = endTimeHourse - startTimeHourse;
  let differenceMinutes = endTimeMinutes - startTimeMinutes;

  if (differenceHourse < 0) {
    differenceHourse = 24 - Math.abs(differenceHourse);
  }

  if (differenceMinutes < 0) {
    differenceMinutes = 60 - Math.abs(differenceMinutes);
    if (differenceHourse == 0) {
      differenceHourse = 24;
    }
    differenceHourse--;
  }

  return this.checkTime(differenceHourse) + ":" + this.checkTime(differenceMinutes);
}

function correctDateString(dateString) {
  return dateString.replace(/\-/g, "/")
}

module.exports = { 
  showBusy, 
  showSuccess,
  showModel,
  formatTime,
  convertToStarsArray,
  http,
  convertToCastString,
  convertToCastInfos,
  uuid,
  checkTime,
  shatterDate,
  calculateHowLong,
  correctDateString,
 }
