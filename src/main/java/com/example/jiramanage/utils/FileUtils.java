package com.example.jiramanage.utils;

import com.example.jiramanage.exception.DeleteFileException;
import java.io.File;
import java.text.DecimalFormat;

public class FileUtils {

  public static long getFolderSize(File directory) {
    long length = 0;
    for (File file : directory.listFiles()) {
      if (file.isFile()) {
        length += file.length();
      } else {
        length += getFolderSize(file);
      }
    }
    return length;
  }

  public static String convertSizeToHumanReadable(long size) {
    String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
    int unitIndex = size > 0 ? (int) (Math.log10(size) / 3) : 0;
    double unitValue = 1 << (unitIndex * 10);

    return new DecimalFormat("#,##0.#").format(size / unitValue) + " " + units[unitIndex];

  }

  private final static long KB_FACTOR = 1024;
  private final static long MB_FACTOR = 1024 * KB_FACTOR;
  private final static long GB_FACTOR = 1024 * MB_FACTOR;

  public static long humanReadableToBytes(String size) {
    int spaceNdx = size.indexOf(" ");
    double ret = Double.parseDouble(size.substring(0, spaceNdx));
    switch (size.substring(spaceNdx + 1)) {
      case "GB":
        return (long) ret * GB_FACTOR;
      case "MB":
        return (long) ret * MB_FACTOR;
      case "KB":
        return (long) ret * KB_FACTOR;
    }
    return -1;
  }

  public static long deleteTempFile(File directory) throws DeleteFileException {
    long size = 0;
    for (File file : directory.listFiles()) {
      if (file.isFile()) {
        if (file.getName().toLowerCase().contains("jiraxporter")) {
          size += file.length();
          if (!file.delete()) {
            throw new DeleteFileException("The file " + file.getName() + "can not be removed.");
          }
        }
      } else {
        size += deleteTempFile(file);
      }
    }
    return size;
  }
}
