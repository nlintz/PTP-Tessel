#include <errno.h>
#include <termios.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <sys/types.h>
       #include <sys/stat.h>
              #include <fcntl.h>


int serialport_init(const char* serialport, int baud)
{
  struct termios toptions;     //from the termios lib
  int fd;                      //file descriptor
  //Open the port as a file
  //O_RDWR = Open as read and write
  //O_NOCTTY = TTY file not to be used for control purposes
  fd = open(serialport, O_RDWR | O_NOCTTY);
  //set the baudrate
  speed_t brate = baud;
  //setting the input and output speed
  cfsetispeed(&toptions, brate);
  cfsetospeed(&toptions, brate);
}
