theApp.filter("ordinalSuffix", function () {
  return function (value) {
    let i = parseInt(value);
    if (isNaN(i)) return value;

    let j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  };
});

theApp.filter("currency", function () {
  return function (value) {
    let cur = value.toLocaleUpperCase();
    if (value === "_S_") cur = "✯";
    return cur;
  };
});

theApp.filter("fraction", function () {
  return function (value, reverse) {
    let temp = parseFloat(value);
    temp = ((temp + "").split(".")[1] || "00").substring(0, 2);
    if (temp.length === 1) temp = temp + "0";
    return temp;
  };
});

theApp.filter("abs", function () {
  return function (value, reverse) {
    if (!value) return 0;
    return (value.toLocaleString() + "").split(".")[0] || "0";
  };
});

theApp.filter("money", function () {
  return function (value, reverse) {
    if (value === undefined) return "";
    let temp = parseFloat(value);
    if (isNaN(temp)) return "0";
    return temp.toLocaleString(
      undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  };
});

theApp.filter("moneyCompact", function () { // if it is integer, it is integer. If it is 0.012 it is 0.01
  return function (value, reverse) {
    if (value === undefined) return "";
    let temp = parseFloat(value);
    if (isNaN(temp)) return "0";
    return temp.toLocaleString(
      undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    );
  };
});

theApp.filter("distance", function () {
  return function (value, reverse) {
    if (value === undefined) return "";
    let temp = Math.round(value);
    if (isNaN(temp)) return "0";

    if (TheM && TheM.user && TheM.user.metric === false) {
      if (temp * 0.0006213712 < 0.5) return Math.round(temp * 3.28084) + " ft";
      if (temp * 0.0006213712 < 10) return (temp * 0.0006213712).toFixed(1) + " mi"
      return Math.round(temp * 0.0006213712) + " mi";
    }

    if (temp > 10000) return Math.round(temp / 1000) + " km"
    if (temp > 1000) return (temp / 1000).toFixed(1) + " km"
    return Math.round(temp) + "m";
  };
});

theApp.filter("money4dec", function () {
  return function (value, reverse) {
    if (value === undefined) return "";
    let temp = parseFloat(value);
    if (isNaN(temp)) return "0";
    return parseFloat(value).toFixed(4);
  };
});

theApp.filter("referralCode", function () {
  return function (value, reverse) {
    if (value === undefined) return "";
    return value.substr(0, 2) + "-" + value.substr(2, 4) + "-" + value.substr(6, 3);
  };
});

theApp.filter("Date", function () {  //MM/DD/YYYY
  return function (input) {
    if (TheM && TheM.user && TheM.user.metric === false) return moment(input).format("MM/DD/YYYY");
    return moment(input).format("DD.MM.YYYY");
  }
});

theApp.filter("DateLong", function () { //dddd MM/DD/YYYY
  return function (input) {
    if (TheM && TheM.user && TheM.user.metric === false) return moment(input).format("dddd MM/DD/YYYY");
    return moment(input).format("dddd DD.MM.YYYY");
  }
});

theApp.filter("DateShort", function () {
  return function (input) {
    if (TheM && TheM.user && TheM.user.metric === false) {
      if (moment(input).isSame(moment(), "year")) return moment(input).format("MM/DD"); //this year  
      return moment(input).format("MM/DD/YYYY");

    } else {
      if (moment(input).isSame(moment(), "year")) return moment(input).format("DD.MM"); //this year  
      return moment(input).format("DD.MM.YYYY");
    }
  }
});

theApp.filter("DateAdaptive", function () {//return like "today, 12:45" or "29.09" or "29.09.2016"
  return function (input) {
    if (TheM && TheM.user && TheM.user.metric === false) {
      //US
      if (moment(input).isSame(moment(), "day")) return moment(input).format("hh:mm a"); //today

      if (moment(input).diff(moment(), "days") < 7 && moment(input).isBefore(moment())) return "Past " + moment(input).format("dddd"); //less than 7 days
      if (moment(input).diff(moment(), "days") < 7) return moment(input).format("dddd"); //less than 7 days

      let temp = moment(input).toDate().valueOf() - (new Date()).valueOf();
      if (temp > 0 && temp < 48 * 60 * 60 * 1000) //less than 48 hours
        return moment(input).format("MMM DD hh:mm a"); //this year  

      if (moment(input).isSame(moment(), "year")) return moment(input).format("MMM DD"); //this year  

      return moment(input).format("MM/DD/YYYY");
    } else {
      //world
      if (moment(input).isSame(moment(), "day")) return moment(input).format("HH:mm"); //today

      if (moment(input).diff(moment(), "days") < 7) return moment(input).format("dddd");

      let temp = moment(input).toDate().valueOf() - (new Date()).valueOf();
      if (temp > 0 && temp < 48 * 60 * 60 * 1000) //less than 48 hours
        return moment(input).format("MMM DD HH:mm"); //this year  

      if (moment(input).isSame(moment(), "year")) return moment(input).format("DD.MM"); //this year  
      return moment(input).format("DD.MM.YYYY");
    }
  }
});

theApp.filter("DateMMYY", function () {
  return function (input) {
    return moment(input).format("MMM.YYYY");
  }
});

theApp.filter("DateMMMDD", function () {
  return function (input) {
    return moment(input).format("MMM DD");
  }
});

theApp.filter("DateTime", function () { //DD.MM.YYYY hh:mm:ss
  return function (input) {
    return moment(input).format("DD.MM.YYYY hh:mm:ss");
  }
});

theApp.filter("DateTimeFull", function () { //DD.MM.YYYY hh:mm
  return function (input) {
    return moment(input).format("DD.MM.YYYY hh:mm:ss");
  }
});

theApp.filter("DateTimeShort", function () { //MMM DD hh:mm
  return function (input) {
    return moment(input).format("MMM DD hh:mm");
  }
});

theApp.filter("Time", function () {
  return function (input) {
    if (TheM && TheM.user && TheM.user.metric === false) return moment(input).format("hh:mm a");
    return moment(input).format("HH:mm");
  }
});

theApp.filter("ToLowerCase", function () {
  return function (input) {
    return (input || "").toLocaleLowerCase();
  }
});

theApp.filter("TimeFull", function () { //hh:mm:ss
  return function (input) {
    return moment(input).format("hh:mm:ss"); //new Date(input);
  }
});

theApp.filter("TimeDiffHumanized", function () {
  return function (input) {
    return moment.duration(moment().diff(moment(input))).humanize();
  };
});

theApp.filter("TimeDiffLeft", function () {
  return function (input) {
    return moment(input).diff(moment());
  };
});


theApp.filter("inputMaskSsn", function () {
  return function (input) {
    input = input || "";
    input = input.trim();
    input = input.padEnd(10, "_");
    if (input.length > 3)
      input = input.substr(0, 3) + "-" + input.substr(3, 6);
    if (input.length > 6)
      input = input.substr(0, 6) + "-" + input.substr(6, 4);
    return input;
  };
});

theApp.filter("cardNumFormatted", function () {
  return function (value, reverse) {
    value = value || "";
    value = value.trim();
    if (value.length < 1) return "";
    value = value + "";
    value = value.trim().replace(/\D/g, "");
    if (value.length < 16)
      return value.substr(0, 4) + " 0000 0000 " + value.slice(-4);
    return value.substr(0, 4) + " " + value.substr(4, 4) + " " + value.substr(8, 4) + " " + value.substr(12, 4);

  };
});

theApp.filter("cardExpiryFormatted", function () {
  return function (value) {
    let dts = new Date(value);
    if (dts instanceof Date && !isNaN(dts)) {
      return (dts.getMonth() + 1 + "").padStart(2, "0") + "/" + (dts.getFullYear() + "").slice(-2)
    } else {
      return "";
    }
  };
});


theApp.filter("PhoneNumber", function () {
  return function (input) {
    let phoneFormat = /^(\d{3})?(\d{3})(\d{4})$/;
    let parsed = phoneFormat.exec(input);

    //if input is not either 7 or 10 characters numeric, just return input
    return (!parsed) ? input : ((parsed[1]) ? "(" + parsed[1] + ") " : "") + parsed[2] + "-" + parsed[3];
  }
});








theApp.filter("CurrencyCodeToText", function () {
  return function (input) {
    switch (input) {
      case "_S_":
        return "Reward stars";
      case "USD":
        return "USA Dollars";
      case "EUR":
        return "European Euros";
      case "AED":
        return "UAE Dirhams";
      case "GBP":
        return "UK Pounds";
      case "KWD":
        return "Kuwaiti Dinars";
      case "ZAR":
        return "South African Rands";
      case "CHF":
        return "Swiss Francs";
      case "CHF":
        return "Swiss Francs";
      case "TRY":
        return "Turkish liras";
      case "KZT":
        return "Kazakhstani tenge";
      case "JPY":
        return "Japanese yen";
      case "JOD":
        return "Jordanian dinars";
      case "MXN":
        return "Mexican pesos";
      case "CAD":
        return "Canadian dollars";
      default:
        if (TheM && TheM.statics && TheM.statics.currencyNames && TheM.statics.currencyNames[input.toLocaleUpperCase()]) return TheM.statics.currencyNames[input.toLocaleUpperCase()];
        return input;
    }
  }
});

theApp.filter("CountryCodeToText", function () {
  //Transforms ISO-3366-1: Alpha-2 Codes to text. "AE" to "United Arab Emirates"
  return function (input) {
    switch (input) {
      case "CA":
        return "Canada";
      case "FR":
        return "France";
      case "DE":
        return "Germany";
      case "HK":
        return "Hong Kong";
      case "KZ":
        return "Kazakhstan";
      case "SG":
        return "Singapore";
      case "ZA":
        return "South Africa";
      case "ES":
        return "Spain";
      case "CH":
        return "Switzerland";
      case "AE":
        return "United Arab Emirates";
      case "GB":
        return "United Kingdom";
      case "US":
        return "United States";
      default:
        if (TheM && TheM.statics && TheM.statics.countries && TheM.statics.countries.length > 0 && input)
          for (let country of TheM.statics.countries)
            if (input.toLocaleUpperCase() === country.code) return country.name;
        return input;
    }
  }
});