package com.iteye.tianshi.core.web.controller;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.iteye.tianshi.core.util.ResponseData;

/**
 *
 * @datetime 2010-8-9 下午01:17:20
 * @author jiangzx@yahoo.com
 */
abstract public class BaseController {

	//protected final Logger logger = LoggerFactory.getLogger(getClass());
	
	public final static String EXCEPTION_MESSAGE = "EXCEPTION_MESSAGE";

	//~ Instance fields ================================================================================================
	
	//~ Methods ========================================================================================================
	@InitBinder
	public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
    }
	
	@ExceptionHandler()
	public @ResponseBody String handleException(Exception exception, HttpServletRequest request, HttpServletResponse response) {
		//logger.error(request.getRequestURI() + " 请求失败", exception);
		if(!(request.getRequestURI().endsWith(".json") || request.getRequestURI().endsWith("Json")))
			throw new RuntimeException(exception);
		
		ResponseData data = new ResponseData(false, exception.getClass() + ": " + exception.getMessage());
		data.setRequestURI(request.getRequestURI());
		data.setExecptionTrace(ExceptionUtils.getFullStackTrace(exception));
		request.setAttribute(EXCEPTION_MESSAGE, data.getExecptionTrace());
		
		String json = JSON.toJSONString(data);
		
		response.setStatus(500);//服务端处理失败
		response.setContentType("application/json;charset=UTF-8");
		return json;
	}
}
