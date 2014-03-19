package com.iteye.tianshi.core.page;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @datetime 2010-7-6 下午06:01:46
 * @author jiangzx@yahoo.com
 */
public class PageRequest<E> {

	/**
	 * 等于过滤条件
	 */
	private Map<String, Object> filters = new HashMap<String, Object>();

	/**
	 * Like过滤条件
	 */
	private Map<String, String> likeFilters = new HashMap<String, String>();
	
	/**
	 * 查询Join 实体名称
	 */
	private List<String> joinEntitys = new ArrayList<String>();
	
	//指定时间范围查询，开始时间，结束时间，指定字段
	private Date startTime;
	private Date endTime;
	private String timeField;
	
	private String extraCondition;
	
	/**
	 * 开始查询行索引
	 */
	private int startIndex;
	/**
	 * 页号码,页码从1开始
	 */
	private int pageNumber;
	/**
	 * 分页大小
	 */
	private int pageSize;
	/**
	 * 排序的多个列,如: username desc
	 */
	private String sortColumns;

	public PageRequest(int startIndex, int pageSize) {
		this.startIndex = startIndex;
		this.pageNumber = startIndex/pageSize;
		this.pageSize = pageSize;
	}

	public int getPageNumber() {
		return pageNumber;
	}

	public void setPageNumber(int pageNumber) {
		this.pageNumber = pageNumber;
	}

	public int getPageSize() {
		return pageSize;
	}

	public void setPageSize(int pageSize) {
		this.pageSize = pageSize;
	}

	public String getSortColumns() {
		return sortColumns;
	}

	public Map<String, Object> getFilters() {
		return filters;
	}

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	public String getTimeField() {
		return timeField;
	}

	public void setTimeField(String timeField) {
		this.timeField = timeField;
	}

	public Map<String, String> getLikeFilters() {
		return likeFilters;
	}

	public List<String> getJoinEntitys() {
		return joinEntitys;
	}

	public int getStartIndex() {
		return startIndex;
	}
	
	public String getExtraCondition() {
		return extraCondition;
	}

	public void setExtraCondition(String extraCondition) {
		this.extraCondition = extraCondition;
	}

	/**
	 * 排序的列,可以同时多列,使用逗号分隔,如 username desc,age asc
	 * @return
	 */
	public void setSortColumns(String sortColumns) {
		this.sortColumns = sortColumns;
	}

}
