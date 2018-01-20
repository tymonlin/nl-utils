/**
 * Created by linchunhui on 2018/1/20.
 */
angular.module('nlUtils', [])
    .factory('StringUtils', function () {
        return {
            isEmpty: function(obj) {
                if (obj == undefined || obj == '' || obj == {} || obj.length < 1) {
                    return true;
                }
                return false;
            },
            isNotEmpty: function(obj) {
                return !this.isEmpty(obj);
            },
            lpad: function (str, len, padStr) {
                str += '';
                if (str.length >= len) return str;
                var temp = str;
                while (temp.length < len) {
                    temp = padStr + temp;
                }
                return temp;
            },
            rpad: function (str, len, padStr) {
                str += '';
                if (str.length >= len) return str;
                var temp = str;
                while (temp.length < len) {
                    temp += padStr;
                }
                return temp;
            },
            isNumber: function(str) {
                return str == undefined || str == '' ? false : /^\d+$/.test(str);
            },
            isPid: function(str) {
                return this.isEmpty(str) ? false : /^\d{6}(19|20)\d{2}(0\d|10|11|12)((0|1|2)\d|30|31)\d{3}(X|x|\d)/.test(str);
            },
            isNull: function(val1, val2, defValue){
                if (this.isEmpty(val1) == false) return val1;
                if (this.isEmpty(val2) == false) return val2;
                return defValue;
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
    })
    .factory('DateUtils', function (StringUtils) {
        return {
            formatDate: function (date) {
                if (date == undefined) return undefined;
                if (typeof date != "object") {
                    console.log("无法识别的类型:" + (typeof date));
                    return date;
                }
                return (date.getYear() + 1900) + "-" + StringUtils.lpad((date.getMonth() + 1), 2, "0") + "-" + StringUtils.lpad(date.getDate(), 2, "0");
            },
            /**
             * 获取日期格式
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
            timestamp: function (date) {
                var d = date ? date : new Date();
                return Date.parse(d);
            },
            today: function () {
                var d = new Date();
                return this.formatDate(d);
            },
            getNowTime: function () {
                return this.formatDate(new Date());
            },
            getNowDate: function () {
                var s, d;
                d = new Date();
                s = d.getUTCFullYear() + "-";
                s += ("00" + (d.getUTCMonth() + 1)).slice(-2) + "-";
                s += ("00" + d.getUTCDate()).slice(-2);
                return s;
            },
            getDiffDays: function (days) {
                var s, d, t, t2;
                t = new Date().getTime();
                t2 = days * 1000 * 3600 * 24;
                t += t2;
                d = new Date(t);
                s = d.getUTCFullYear() + "-";
                s += ("00" + (d.getUTCMonth() + 1)).slice(-2) + "-";
                s += ("00" + d.getUTCDate()).slice(-2);
                return s;
            }
        };
    })
    .factory('MoneyUtils', function ($locale) {
        return {
            "formatMoney": function(amount, currencySymbol, fractionSize) {
                var formats = $locale.NUMBER_FORMATS;
                if (currencySymbol == undefined) {
                    currencySymbol = formats.CURRENCY_SYM;
                }

                if (fractionSize == undefined) {
                    fractionSize = formats.PATTERNS[1].maxFrac;
                }

                // if null or undefined pass it through
                return (amount == null)
                    ? amount
                    : this.formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize).
                replace(/\u00A4/g, " " + currencySymbol);
            },


            "formatNumber": function (number, pattern, groupSep, decimalSep, fractionSize) {
                var DECIMAL_SEP = '.';
                if (angular.isObject(number)) return '';

                var isNegative = number < 0;
                number = Math.abs(number);

                var isInfinity = number === Infinity;
                if (!isInfinity && !isFinite(number)) return '';

                var numStr = number + '',
                    formatedText = '',
                    hasExponent = false,
                    parts = [];

                if (isInfinity) formatedText = '\u221e';

                if (!isInfinity && numStr.indexOf('e') !== -1) {
                    var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
                    if (match && match[2] == '-' && match[3] > fractionSize + 1) {
                        number = 0;
                    } else {
                        formatedText = numStr;
                        hasExponent = true;
                    }
                }

                if (!isInfinity && !hasExponent) {
                    var fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

                    // determine fractionSize if it is not specified
                    if (angular.isUndefined(fractionSize)) {
                        fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac);
                    }

                    // safely round numbers in JS without hitting imprecisions of floating-point arithmetics
                    // inspired by:
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
                    number = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);

                    var fraction = ('' + number).split(DECIMAL_SEP);
                    var whole = fraction[0];
                    fraction = fraction[1] || '';

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
                        fraction += '0';
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
                return parts.join('');
            }
        };
    });