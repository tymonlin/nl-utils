/**
 * Created by Tymon.Lin on 2018/1/20.
 */
(function (angular) {
    "use strict";
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    var utils = angular.module("nlUtils", []);
    utils.factory("StringUtils", function () {
        return {
            isEmpty: function(obj) {
                return (obj == undefined || obj == "" || obj == {} || obj.length < 1);
            },
            isNotEmpty: function(obj) {
                return !this.isEmpty(obj);
            },
            lpad: function (str, len, padStr) {
                str += "";
                while (str.length < len) str = padStr + str;
                return str;
            },
            rpad: function (str, len, padStr) {
                str += "";
                while (str.length < len) str += padStr;
                return str;
            },
            isNumber: function(text) {
                return text ? /^\d+$/.test(text) : false;
            },
            trim: function(text) {
                return text == null ? "" : (text + "" ).replace(rtrim, "" );
            },
            isPid: function(str) {
                return this.isEmpty(str) ? false : /^\d{6}(19|20)\d{2}(0\d|10|11|12)((0|1|2)\d|30|31)\d{3}(X|x|\d)/.test(str);
            },
            isMobile: function(mobile) {
                return this.isEmpty(mobile) ? false : /^(\+\d{2,3}\-)?\d{11}$/.test(mobile);
            },
            isTel: function(tel) {
                return this.isEmpty(tel) ? false : /^(\d{3}-\d{8}|\d{4}-\d{7,8})(\-\d{1,4})?$/.test(tel);
            },
            isQQ: function(qq) {
                return this.isEmpty(qq) ? false : /^\d{5,20}$/.test(qq);
            },
            isWechat: function(wechat) {
                return this.isEmpty(wechat) ? false : /^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/.test(wechat);
            }
        };
    });
    utils.factory("DateUtils", ["StringUtils", function (StringUtils) {
        return {
            /**
             * Date 转 String , 格式： yyyy-MM-dd
             * @param date
             * @returns {*}
             */
            formatDate: function (date) {
                if (date == undefined) return undefined;
                if (typeof date != "object") {
                    console.log("无法识别的类型:" + (typeof date));
                    return date;
                }
                return (date.getYear() + 1900) + "-" + StringUtils.lpad((date.getMonth() + 1), 2, "0") + "-" + StringUtils.lpad(date.getDate(), 2, "0");
            },
            /**
             * 获取时间格式, Date 转 String, 格式： HH:mm:ss
             * @param date
             * @returns {*}
             */
            formatTime: function (date) {
                if (date == undefined) return undefined;
                if (typeof date != "object") {
                    console.log("无法识别的类型:" + (typeof date));
                    return date;
                }
                return StringUtils.lpad(date.getHours(), 2, "0") + ":" + StringUtils.lpad(date.getMinutes(), 2, "0") + ":" + StringUtils.lpad(date.getSeconds(), 2, "0");
            },
            /**
             * 时间的long型
             * @param date
             * @returns {number}
             */
            timestamp: function (date) {
                var d = date ? date : new Date();
                return Date.parse(d);
            },

            /**
             * 返回当前日期: yyyy-MM-dd
             * @returns {*}
             */
            today: function () {
                return this.formatDate(new Date());
            },
            /**
             * 返回当前时间：HH:mm:ss
             * @returns {*}
             */
            time: function () {
                return this.formatDate(new Date());
            },
            /**
             * 当前日期的时间差
             * @param days
             * @returns {string | *}
             */
            addDays: function (days) {
                var s, d, t, t2;
                t = new Date().getTime();
                t2 = days * 1000 * 3600 * 24;
                t += t2;
                d = new Date(t);
                s = d.getUTCFullYear() + "-";
                s += ("00" + (d.getUTCMonth() + 1)).slice(-2) + "-";
                s += ("00" + d.getUTCDate()).slice(-2);
                return s;
            },
            formatTDateString: function (dateString) {
                if (!dateString) {return "";}
                var time = new Date(Date.parse(dateString));
                var Y = time.getFullYear() + "-";
                var  M = StringUtils.lpad(time.getMonth() + 1, 2, "0") + "-";
                var D = StringUtils.lpad(time.getDate(), 2, "0") + " ";
                var h = StringUtils.lpad(time.getHours(), 2, "0") + ":";
                var m = StringUtils.lpad(time.getMinutes(), 2, "0") + ":";
                var s = StringUtils.lpad(time.getSeconds(), 2, "0");
                return Y + M + D + h + m + s;
            }
        };
    }]);
    utils.factory("MoneyUtils", function ($locale) {
        return {
            "formatMoney": function(amount, currencySymbol, fractionSize) {
                var formats = $locale.NUMBER_FORMATS;
                if (currencySymbol == undefined) {
                    currencySymbol = formats.CURRENCY_SYM;
                }

                if (fractionSize == undefined) {
                    fractionSize = formats.PATTERNS[1].maxFrac;
                }

                return (amount == null)
                    ? amount
                    : this.formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize).
                    replace(/\u00A4/g, " " + currencySymbol);
            },


            "formatNumber": function (number, pattern, groupSep, decimalSep, fractionSize) {
                var DECIMAL_SEP = ".";
                if (angular.isObject(number)) return "";

                var isNegative = number < 0;
                number = Math.abs(number);

                var isInfinity = number === Infinity;
                if (!isInfinity && !isFinite(number)) return "";

                var numStr = number + "",
                    formatedText = "",
                    hasExponent = false,
                    parts = [];

                if (isInfinity) formatedText = "\u221e";

                if (!isInfinity && numStr.indexOf("e") !== -1) {
                    var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
                    if (match && match[2] == "-" && match[3] > fractionSize + 1) {
                        number = 0;
                    } else {
                        formatedText = numStr;
                        hasExponent = true;
                    }
                }

                if (!isInfinity && !hasExponent) {
                    var fractionLen = (numStr.split(DECIMAL_SEP)[1] || "").length;
                    // determine fractionSize if it is not specified
                    if (angular.isUndefined(fractionSize)) {
                        fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
                    }

                    number = +(Math.round(+(number.toString() + "e" + fractionSize)).toString() + "e" + -fractionSize);

                    var fraction = ("" + number).split(DECIMAL_SEP);
                    var whole = fraction[0];
                    fraction = fraction[1] || "";

                    var i, pos = 0,
                        lgroup = pattern.lgSize,
                        group = pattern.gSize;

                    if (whole.length >= (lgroup + group)) {
                        pos = whole.length - lgroup;
                        for (i = 0; i < pos; i++) {
                            if ((pos - i) % group === 0 && i !== 0) {
                                formatedText += groupSep;
                            }
                            formatedText += whole.charAt(i);
                        }
                    }

                    for (i = pos; i < whole.length; i++) {
                        if ((whole.length - i) % lgroup === 0 && i !== 0) {
                            formatedText += groupSep;
                        }
                        formatedText += whole.charAt(i);
                    }

                    // format fraction part.
                    while (fraction.length < fractionSize) {
                        fraction += "0";
                    }

                    if (fractionSize && fractionSize !== "0") formatedText += decimalSep + fraction.substr(0, fractionSize);
                } else {
                    if (fractionSize > 0 && number < 1) {
                        formatedText = number.toFixed(fractionSize);
                        number = parseFloat(formatedText);
                        formatedText = formatedText.replace(DECIMAL_SEP, decimalSep);
                    }
                }

                if (number === 0) {
                    isNegative = false;
                }

                parts.push(isNegative ? pattern.negPre : pattern.posPre,
                    formatedText,
                    isNegative ? pattern.negSuf : pattern.posSuf);
                return parts.join("");
            }
        };
    });
})(angular)
