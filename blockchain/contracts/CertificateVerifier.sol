// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerifier {
    struct Certificate {
        string certificateNumber;
        address issuer;
        address recipient;
        uint256 issuedAt;
        string courseId;
        string courseName;
        string recipientName;
        bool isValid;
    }

    mapping(string => Certificate) public certificates;
    address public owner;
    mapping(address => bool) public authorizedIssuers;

    event CertificateIssued(
        string certificateNumber,
        address indexed recipient,
        string courseId,
        uint256 issuedAt
    );

    event CertificateRevoked(
        string certificateNumber,
        uint256 revokedAt
    );

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can call this function");
        _;
    }

    function addIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = true;
    }

    function removeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
    }

    function issueCertificate(
        string memory certificateNumber,
        address recipient,
        string memory courseId,
        string memory courseName,
        string memory recipientName
    ) public onlyAuthorizedIssuer {
        require(certificates[certificateNumber].issuedAt == 0, "Certificate already exists");
        
        certificates[certificateNumber] = Certificate({
            certificateNumber: certificateNumber,
            issuer: msg.sender,
            recipient: recipient,
            issuedAt: block.timestamp,
            courseId: courseId,
            courseName: courseName,
            recipientName: recipientName,
            isValid: true
        });

        emit CertificateIssued(certificateNumber, recipient, courseId, block.timestamp);
    }

    function revokeCertificate(string memory certificateNumber) public onlyAuthorizedIssuer {
        require(certificates[certificateNumber].issuedAt > 0, "Certificate does not exist");
        require(certificates[certificateNumber].isValid, "Certificate is already revoked");
        
        certificates[certificateNumber].isValid = false;
        emit CertificateRevoked(certificateNumber, block.timestamp);
    }

    function verifyCertificate(string memory certificateNumber) public view returns (
        bool exists,
        bool isValid,
        address issuer,
        address recipient,
        uint256 issuedAt,
        string memory courseId,
        string memory courseName,
        string memory recipientName
    ) {
        Certificate memory cert = certificates[certificateNumber];
        
        if (cert.issuedAt == 0) {
            return (false, false, address(0), address(0), 0, "", "", "");
        }

        return (
            true,
            cert.isValid,
            cert.issuer,
            cert.recipient,
            cert.issuedAt,
            cert.courseId,
            cert.courseName,
            cert.recipientName
        );
    }
} 