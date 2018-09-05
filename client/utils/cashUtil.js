let obj = {};
obj.set_cache = function (cache_name, key, value) {
  var that = this;
  var obj = wx.getStorageSync('cache') || {};
  obj[cache_name] = obj[cache_name] || {};
  if (!obj[cache_name][key]){
    obj[cache_name][key] = [];
  } 
  obj[cache_name][key].push(value);
  wx.setStorageSync('cache', obj);
};

obj.get_cache = function (cache_name, key) {
  
  if (wx.getStorageSync('cache')[cache_name]) {
    return  wx.getStorageSync('cache')[cache_name][key];
  }

  return undefined;
};

export default obj;