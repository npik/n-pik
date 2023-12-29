# 컨트랙트 컴파일

npx hardhat compile

> 가끔 오류 나는데 글로벌에 설치된 hardhat과 로컬 노드모듈스 삭제 후
npm install을 다시하고 실행하면 된다.

# 배포

1. node ./index.js
또는
2. npx hardhat run ./index.js --network goerli

# 컨트렉트 공개

1. `npx hardhat flatten .\contracts\ERC20Token.sol > ./combiend.sol`
2. 이더스캔에서 컨트랙트 publish에서 싱글 파일로 붙여 넣으면 된다.


# 이슈
ethers 5 버전으로 사용해야 한다.
최신 6버전은 인터페이스가 달라진듯.
