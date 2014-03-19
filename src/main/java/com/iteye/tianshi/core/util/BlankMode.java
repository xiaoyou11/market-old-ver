package com.iteye.tianshi.core.util;

/**
 * SQL 语句where条件部分，
 * 	如果property值为 NULL，添加条件 property is null;
 *  如果property值为 NOTNULL，添加条件 property is not null;
 *
 * @datetime 2011-7-13 下午01:48:31
 * @author jiangzx@yahoo.com
 */
public enum BlankMode {
	/**
	 * 空
	 */
	NULL("null"),
	
	/**
	 * 不为空
	 */
	NOTNULL("not null");
	
	private BlankMode(String mode) {
		this.mode = mode;
	}
	
	private String mode;
	public String getMode() {
		return mode;
	}
	public void setMode(String mode) {
		this.mode = mode;
	}
}
