import sys
import io
import pandas as pd

# 출력의 인코딩을 utf-8로 설정한다
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

# CSV 파일 경로
csv_path = './mydata.csv'

# CSV 파일 불러오기 (인코딩 설정에 맞게 조정)
df = pd.read_csv(csv_path, encoding='euc-kr')

def get_weather_by_date(input_date):
    try:
        # 입력받은 날짜를 int로 변환
        input_date = int(input_date)
    except ValueError:
        return "날짜 형식이 올바르지 않습니다. YYYYMMDD 형식으로 입력하세요."
    
    # 해당 날짜에 맞는 데이터 필터링
    result = df[df['TM'] == input_date]
    
    if not result.empty:
        # 해당 날짜의 데이터 추출
        ca_tot = result.iloc[0]['CA_TOT']
        hm_avg = result.iloc[0]['HM_AVG']
        rn_day = result.iloc[0]['RN_DAY']
        
        # 결과 출력 (Node.js로 전달될 값)
        return f"날짜: {input_date}\n구름량: {ca_tot}, 습도: {hm_avg}, 강수량: {rn_day}"
    else:
        return "해당 날짜의 데이터가 존재하지 않습니다."

# Node.js에서 전달된 날짜 인자 받기
if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Node.js에서 날짜 인자를 전달받은 경우
        date = sys.argv[1]
        weather_info = get_weather_by_date(date)
        print(weather_info)
    else:
        # 단독 실행 시 사용자가 날짜를 입력하는 경우
        date = input("날짜를 YYYYMMDD 형식으로 입력하세요: ")
        weather_info = get_weather_by_date(date)
        print(weather_info)
