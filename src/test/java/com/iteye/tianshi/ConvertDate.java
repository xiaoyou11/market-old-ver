package com.iteye.tianshi;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class ConvertDate {

	public static class StringUtil {
		
		/*毫秒转日期*/
		public String getDateTimeByMillisecond(String str) {
			Date date = new Date(Long.valueOf(str));
			SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
			String time = format.format(date);
			return time;
		}
		
		/*日期转毫秒*/
		public String  getMillisecondByDateTime(String str) {
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
				long millionSeconds = 0;
				try {
					millionSeconds = sdf.parse(str).getTime();
				} catch (ParseException e) {
					e.printStackTrace();
				}//毫秒
				return String.valueOf(millionSeconds);
		}
		
		public static void main(String[] args) {

			Calendar calendar = Calendar.getInstance();
			String str = String.valueOf(calendar.getTimeInMillis());
			String time1 = new StringUtil().getDateTimeByMillisecond(str);
			String time2 = new StringUtil().getDateTimeByMillisecond("1365488000");
			String time3 = new StringUtil().getDateTimeByMillisecond("1375574400");
			String date = new StringUtil().getMillisecondByDateTime("1970-01-17 00:06:14");
			System.out.println(time1 + "\n" + time2+"\n"+time3+"\n"+date);
			//1202774000
		}
	}
}
